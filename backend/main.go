package main

import (

	"gorm.io/gorm"
	"my-backend/initialization"
)

// --- Main Entry Point ---

func main() {
	var db *gorm.DB
	Initialization.InitDB(db)
	r := Initialization.SetupRouter(db)
	r.Run(":8080")
}