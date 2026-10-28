up:
	sudo docker compose -f docker/docker-compose.yaml up -d

down:
	sudo docker compose -f docker/docker-compose.yaml down
	
exec:
	sudo docker exec -it muninn bash

recreate:
	sudo docker compose -f docker/docker-compose.yaml up -d --force-recreate

rebuild: 
	sudo docker compose -f docker/docker-compose.yaml up -d --build --force-recreate

logs:
	sudo docker logs muninn -f

release: tag
	gh release create $(VERSION) --generate-notes

dev-up:
	sudo docker compose -f docker/docker-compose.dev.yaml up -d

dev-build:
	sudo docker compose -f docker/docker-compose.dev.yaml up --build --force-recreate -d

dev-down:
	sudo docker compose -f docker/docker-compose.dev.yaml down

dev-logs:
	sudo docker logs muninn-dev -f

seed-user:
	bun run db:seed-user

.PHONY: up down exec recreate rebuild logs release dev-up dev-build dev-down dev-logs seed-user
