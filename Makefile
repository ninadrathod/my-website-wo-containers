# Define project paths
FRONTEND_DIR := frontend
UPLOAD_SERVICE_DIR := upload-service

# Define production flag (set to true for production, false for development)
# To run in production mode: make build PROD=true
PROD ?= false

# setup-images-dir:
# 	@echo "Ensuring upload-service/images directory exists and has write permission..."
# 	@if [ ! -d "$(UPLOAD_SERVICE_DIR)/images" ]; then \
# 		mkdir -p "$(UPLOAD_SERVICE_DIR)/images"; \
# 		echo "Directory $(UPLOAD_SERVICE_DIR)/images created."; \
# 	else \
# 		echo "Directory $(UPLOAD_SERVICE_DIR)/images already exists."; \
# 	fi; \
# 	chmod 777 "$(UPLOAD_SERVICE_DIR)/images"

# Target to build and start the Docker Compose application
build:
	@echo "Building and starting Docker Compose application..."
	docker-compose up -d --build
ifeq ($(PROD), false)
	docker exec -d -it frontend npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
endif
	@echo "Docker Compose application is running."

# initial_build: setup-images-dir build
initial_build: build

up:
	@echo "Building and starting Docker Compose application..."
	docker-compose up -d
ifeq ($(PROD), false)
	docker exec -d -it frontend npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
endif
	@echo "Docker Compose application is running."

# Optional target to stop and remove containers
down:
	@echo "Stopping and removing Docker Compose containers..."
	docker-compose down
	@echo "Docker Compose containers stopped and removed."

# Optional target to rebuild the Docker images
rebuild: down build

destroy_project:
	@echo "Destroying all containers, images, volumes, and networks..."
	docker-compose down --volumes --rmi all # Stop and remove containers, volumes, and images
	docker system prune -a --volumes -f # Aggressively prune everything
	@echo "All Docker resources related to project destroyed."
	@echo "Deleting residual files from host directories..."
	rm -rf $(FRONTEND_DIR)/src/output.css $(FRONTEND_DIR)/node_modules/
	@echo "Clean-up complete."

# .PHONY: setup-images-dir initial_build build up down rebuild destroy_project
.PHONY: initial_build build up down rebuild destroy_project