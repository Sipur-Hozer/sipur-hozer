package main

import (
	"log"
	"my-backend/initialization"
	"my-backend/storage"
)

func main() {
	// 1. Initialize the raw DB connection
	db := Initialization.InitDB()

	// 2. Wrap it in the Postgres Registry
	// This "injects" the database dependency into our storage layer
	registry := storage.NewPostgresRegistry(db)

	// 3. Pass the registry (interface) to the router
	r := Initialization.SetupRouter(registry)

	log.Println("Server is running on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}