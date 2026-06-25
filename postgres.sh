# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/loihub"
# npx prisma generate
# npx prisma migrate dev --name init

podman run --name loihub-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=loihub \
  -p 5432:5432 \
  -d docker.io/library/postgres:17