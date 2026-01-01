package main

import (
	"gorm.io/gorm"
	
	// Make sure this matches your go.mod module name
	"my-backend/initialization"
)

// --- Main Entry Point ---

func main() {
	var db *gorm.DB

	// Capture the returned database instance from InitDB
	db = Initialization.InitDB()

	// Pass the active database connection to the router
	r := Initialization.SetupRouter(db)

	// Start the server on port 8080
	r.Run(":8080")
}