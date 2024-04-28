# L-Systems-Forest-Fire

## Requirements
- docker (with compose plugin)

## Installation
1. Setup containers
    ```bash
    docker-compose up -d
    ```
2. Install dependencies
    ```bash
    docker exec -it ff-bun bun install
    ```
   
## Running development server
1. Start the development server
    ```bash
    docker exec -it ff-bun bun dev --host
    ```
2. The project should be available at http://localhost:5173