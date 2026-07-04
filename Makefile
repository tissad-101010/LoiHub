.PHONY: up down re fclean index

# `make up` lance toute la stack ET indexe automatiquement la recherche
# (service `indexer` du docker-compose : attend db + meilisearch, indexe, se termine).
up:
	docker compose up -d --build --remove-orphans
	@echo "Acces au service : http://localhost:3000"

down:
	docker compose down

re: down up

fclean:
	docker compose down -v

# Ré-indexer la recherche à la demande, sans redémarrer la stack.
index:
	docker compose run --rm indexer
