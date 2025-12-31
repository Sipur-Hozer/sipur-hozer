package models

import (
	"gorm.io/gorm"
)

// --- Structs ---

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type AddUserRequest struct {
	gorm.Model
	FullName string `json:"fullName"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type ShiftRequest struct {
	gorm.Model
	Phone    	string `json:"phone"`
	Role     	string `json:"role"`
	InStore  	bool   `json:"inStore"`
	EnterShift  string `json:"enterShift"`
	ExitShift 	string `json:"exitShift"`
	Extra	  	string `json:"extra"`
}
