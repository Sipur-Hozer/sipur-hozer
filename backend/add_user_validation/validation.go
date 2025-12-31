func addUserValidation(req *AddUserRequest, db *gorm.DB) bool{	
// Check if user already exists
		var existingUser AddUserRequest
		result := db.Where("phone = ?", req.Phone).First(&existingUser)
		if result.Error == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "User with this phone number already exists"})
			return false
		}

		// Check if the user name contains letters only
		for _, ch := range req.FullName {
			if !unicode.IsLetter(ch) && ch != ' ' {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Full name must contain Hebrew letters only"})
				return false
			}
		}
		
				
		// Check if the user's phone number contains digits only
		for _, ch := range req.Phone {
			if !unicode.IsDigit(ch) && ch != ' ' {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number must contain digits only"})
				return false
			}
		}

		// Check if the user name contains 10 digits
		if len(req.Phone) != 10 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number must be exactly 10 digits"})
			return false
		}
		return true
	}
	