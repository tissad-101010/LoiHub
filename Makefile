.PHONY: up down re fclean

up:
	docker compose up -d --build

down:
	docker compose down

re: down up

fclean:
	docker compose down -v
