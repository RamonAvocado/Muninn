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

tag:
	git tag $(VERSION)
	git push origin $(VERSION)

release: tag
	gh release create $(VERSION) --generate-notes
