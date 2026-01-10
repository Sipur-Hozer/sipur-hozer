package domain

import "my-backend/models"

// ShiftExportData holds the specific fields needed for your Excel export
type ShiftExportData struct {
	FullName   string
	Phone      string
	Role       string
	InStore    bool
	EnterShift string
	ExitShift  string
	Extra      string
}

// UserStore defines operations for Users
type UserStore interface {
	Create(user *models.AddUserRequest) error
	GetByPhone(phone string) (*models.AddUserRequest, error)
	GetAll() ([]models.AddUserRequest, error)
}

// ShiftStore defines operations for Shifts
type ShiftStore interface {
	Create(shift *models.ShiftRequest) error
	GetOpenShift(phone string) (*models.ShiftRequest, error)
	Update(shift *models.ShiftRequest) error
	GetForExport() ([]ShiftExportData, error)
}

// Registry combines all stores into one interface
type Registry interface {
	Users() UserStore
	Shifts() ShiftStore
}