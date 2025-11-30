
class UserStats {
  constructor({ userId, gamesPlayed=0, averageScore=0, highestScore=0, averageAccuracy=0, totalPlayTime=0 }) {
    this.userId = userId;
    this.gamesPlayed = gamesPlayed;
    this.averageScore = averageScore;
    this.highestScore = highestScore;
    this.averageAccuracy = averageAccuracy;
    this.totalPlayTime = totalPlayTime;
  }

  updateStats(score, accuracy, playTime) {
    const prevTotalScore = this.averageScore * this.gamesPlayed;
    this.gamesPlayed += 1;
    this.totalPlayTime += playTime;
    this.highestScore = Math.max(this.highestScore, score);
    this.averageScore = (prevTotalScore + score) / this.gamesPlayed;
    this.averageAccuracy = ((this.averageAccuracy * (this.gamesPlayed - 1)) + accuracy) / this.gamesPlayed;
  }
}

module.exports = UserStats;
