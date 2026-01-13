package storage

import (
	"my-backend/domain"
	"my-backend/models"

	"gorm.io/gorm"
)

// PostgresRegistry implements the domain.Registry interface
type PostgresRegistry struct {
	db *gorm.DB
}

// NewPostgresRegistry creates a new instance
func NewPostgresRegistry(db *gorm.DB) *PostgresRegistry {
	return &PostgresRegistry{db: db}
}

func (r *PostgresRegistry) Users() domain.UserStore {
	return &userStore{db: r.db}
}

func (r *PostgresRegistry) Shifts() domain.ShiftStore {
	return &shiftStore{db: r.db}
}

// --- User Implementation ---

type userStore struct {
	db *gorm.DB
}

func (s *userStore) Create(user *models.AddUserRequest) error {
	return s.db.Create(user).Error
}

func (s *userStore) GetByPhone(phone string) (*models.AddUserRequest, error) {
	var user models.AddUserRequest
	err := s.db.Where("phone = ?", phone).First(&user).Error
	return &user, err
}

func (s *userStore) GetAll() ([]models.AddUserRequest, error) {
	var users []models.AddUserRequest
	err := s.db.Find(&users).Error
	return users, err
}

// --- Shift Implementation ---

type shiftStore struct {
	db *gorm.DB
}

func (s *shiftStore) Create(shift *models.ShiftRequest) error {
	return s.db.Create(shift).Error
}

func (s *shiftStore) GetOpenShift(phone string) (*models.ShiftRequest, error) {
	var shift models.ShiftRequest
	// Logic: Find shift with no exit time
	err := s.db.Where("phone = ? AND exit_shift = ?", phone, "").Order("created_at desc").First(&shift).Error
	return &shift, err
}

func (s *shiftStore) Update(shift *models.ShiftRequest) error {
	return s.db.Save(shift).Error
}

func (s *shiftStore) GetForExport() ([]domain.ShiftExportData, error) {
	var results []domain.ShiftExportData
	err := s.db.Table("shift_requests").
		Select("add_user_requests.full_name, shift_requests.phone, shift_requests.role, shift_requests.in_store, shift_requests.enter_shift, shift_requests.exit_shift, shift_requests.extra").
		Joins("JOIN add_user_requests ON add_user_requests.phone = shift_requests.phone").
		Order("shift_requests.created_at DESC").
		Scan(&results).Error
	return results, err
}