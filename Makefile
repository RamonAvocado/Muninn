up:
	sudo docker compose -f docker/docker-compose.yaml up -d
	
exec:
	sudo docker exec -it muninn bash

recreate:
	sudo docker compose -f docker/docker-compose.yaml up -d --force-recreate

rebuild: 
	sudo docker compose -f docker/docker-compose.yaml up -d --build --force-recreate

logs:
	sudo docker logs muninn -f

tag:
	git tag v$(VERSION)
	git push origin v$(VERSION)

release: tag
	gh release create v$(VERSION) --generate-notes
