import { Challenge } from "../db/models/challenge.js";
import { User } from "../db/index.js";
import { updateTime } from "../utils/update-time.js";
import { setError, handleError } from "../utils/customError.js"
class ChallengeService {
  static makeDueDate(weeks){
    // weeks : '1주','2주','3주','4주'
    let weeksInt = parseInt(weeks.replace('주', '')) 
    let newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + (weeksInt * 7)); 
    return newDueDate
  }
  
  static async createChallenge({ userId, title, content, icon, weeks }) {
    if (!title || !content || !icon || !weeks){ 
      throw setError("제목, 내용, 아이콘, 기간 모두 입력해 주세요.", 400, "BAD_REQUEST")
    }
 
    const dueDate = this.makeDueDate(weeks)
    const createdChallenge = await Challenge.create({ userId, title, content, icon, weeks, dueDate });
    if (!createdChallenge)  
      throw setError("챌린지 게시물 생성 실패", 500, "CREATE_FAILED")
    //--- User Update ---
    const user = await User.findById({ userId: createdChallenge.userId })
    user.mileage += 1000;
    await user.save();
    
    // 한국표준시로 변경
    const createdNewChallenge=updateTime.toTimestamps(createdChallenge)
    
    return createdNewChallenge;
  }

  static async findChallenges(itemsPerPage, cursor) {
    let query = {};

    if (cursor) {
      query = { _id : {$gt: cursor } };
      console.log('cursor',cursor.slice(0,-1))
    }

    const challenges = await Challenge.NoAsyncfindAll()
      .find(query)
      .limit(parseInt(itemsPerPage))
      .populate('userId', 'userName districtCode districtName')
      .exec();

    if (!challenges) {
      throw setError("챌린지 게시물을 찾을 수 없습니다.", 404, "NOT_FOUND")
    }

    // 다음 커서 값 설정
    const nextCursor = challenges[challenges.length - 1]?._id;

    return { challenges, nextCursor };
  }

  static async findChallenge({ chllengeId }) {
    const challenge = await Challenge.NoAsyncfindById({ chllengeId }).populate('userId', 'userName districtCode districtName').exec();
    if (!challenge) {
      throw setError("챌린지 게시물을 찾을 수 없습니다.", 404, "NOT_FOUND")
    }
    // 한국표준시로 변경
    return updateTime.toTimestamps(challenge);
  }

  static async updateChallenge({ chllengeId, currentUserId, title, content, icon, weeks }) {
    const challenge = await Challenge.findById({ _id: chllengeId })
    try{
      if (!challenge) 
        throw setError("해당 id를 가진 데이터는 없습니다.", 404, "NOT_FOUND")
      if (challenge.userId.toString() !== currentUserId) 
        throw setError("수정 권한이 없습니다.", 403, "FORBIDDEN")
      if (challenge.commentsCount != 0)
        throw setError("참여자가 존재하여 수정 할 수 없습니다.", 409, "CONFLICT")
      if (challenge.isCompleted === true)
        throw setError("챌린지 기간이 끝났습니다, 참여 할 수 없습니다.", 409, "CONFLICT")

      const updateChallenge = await Challenge.update({ chllengeId, title, content, icon, weeks, dueDate: this.makeDueDate(weeks) })
        if (!updateChallenge)   
          throw setError("업데이트에 실패했습니다.", 404, "NOT_FOUND")
      // 한국표준시간으로 변경
      return updateTime.toTimestamps(updateChallenge);
    } catch (error) {
      throw handleError(error)
    }
  
  }
  
  static async deleteChallenge(chllengeId, currentUserId) {
    try{
      const challenge = await Challenge.findById({ _id: chllengeId })
      if(!challenge)
        throw setError("해당 id를 가진 데이터는 없습니다.", 404, "NOT_FOUND")
      if(challenge.userId.toString() !== currentUserId)
        throw setError("삭제 권한이 없습니다.", 403, "FORBIDDEN")
      if (challenge.commentsCount != 0)
        throw setError("참여자가 존재하여 삭제 할 수 없습니다.", 409, "CONFLICT")
      // 마감기한 전에 삭제되면 마일리지 회수
      if (challenge.isCompleted == false){
        const user = await User.findById({ userId: challenge.userId })
        user.mileage -= 1000;
        await user.save();
      
      } 
      await Challenge.deleteById(chllengeId);
    } catch (error) {
      throw handleError(error)
    }
  }

}

export { ChallengeService };
