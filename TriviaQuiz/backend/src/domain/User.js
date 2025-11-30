
class User {
  constructor({ id=null, username, email, passwordHash, role='player', avatarUrl=null, createdAt=null, lastLogin=null }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.avatarUrl = avatarUrl;
    this.createdAt = createdAt;
    this.lastLogin = lastLogin;
  }

  updateProfile(data) { Object.assign(this, data); }
}

module.exports = User;
