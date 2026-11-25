#!/usr/bin/env bash
set -euo pipefail

database_dir="$(mktemp -d)"
export DB_SOCKET="$database_dir/mysql.sock"
export DB_NAME=monitoring_ta DB_USER=demo_reader DB_PASS=
export JWT_SECRET="${JWT_SECRET:-$(node -p "require('node:crypto').randomBytes(32).toString('hex')")}"

mariadb_pid=
web_pid=
cleanup() {
  trap - EXIT
  if [[ -n "$web_pid" ]]; then kill "$web_pid" 2>/dev/null || true; fi
  if [[ -n "$mariadb_pid" ]]; then kill "$mariadb_pid" 2>/dev/null || true; fi
  wait || true
  rm -rf -- "$database_dir"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT

# The database listens on a Unix socket and starts from synthetic data.
chown mysql:mysql "$database_dir"
chmod 0755 "$database_dir"
install -d -o mysql -g mysql "$database_dir/data"
mariadb-install-db --user=mysql --datadir="$database_dir/data" --skip-test-db >/dev/null
mariadbd --user=mysql --datadir="$database_dir/data" --socket="$DB_SOCKET" \
  --pid-file="$database_dir/data/server.pid" --skip-networking \
  --innodb-buffer-pool-size=32M --aria-pagecache-buffer-size=16M --max-connections=15 &
mariadb_pid=$!

for attempt in {1..60}; do
  if mariadb-admin --socket="$DB_SOCKET" ping --silent; then break; fi
  if ! kill -0 "$mariadb_pid" 2>/dev/null; then exit 1; fi
  sleep 1
done

mariadb_client=(mariadb --socket="$DB_SOCKET" --default-character-set=utf8mb4)
"${mariadb_client[@]}" -e "CREATE DATABASE monitoring_ta CHARACTER SET utf8mb4"
"${mariadb_client[@]}" monitoring_ta < database/schema.sql
"${mariadb_client[@]}" monitoring_ta < database/demo.sql
"${mariadb_client[@]}" -e "
  CREATE USER 'demo_reader'@'localhost';
  GRANT SELECT ON monitoring_ta.* TO 'demo_reader'@'localhost';
"

gosu node node src/app.js &
web_pid=$!
wait -n "$web_pid" "$mariadb_pid"
