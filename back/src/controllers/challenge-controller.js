import { ChallengeService } from "../services/challenge-service.js";
import { validateEmptyBody } from "../utils/validators.js"
import { CREATED, OK } from "../utils/constants.js";

const challengeController = {
  challengeCreat: async function (req, res, next) {
    try {
      validateEmptyBody(req)
      const userId = req.currentUserId;
      const { title, content, icon, weeks } = req.body;
    
      const challenge = await ChallengeService.createChallenge({ userId, title, content, icon, weeks });
      res.status(CREATED).send(challenge);
    } catch (error) {
      next(error);
    }
  },

  challengeGetAll: async function (req, res, next) {
    try {
      const page = parseInt(req.query.page || 1);
      const limit = 8;
      const skip = (page - 1) * limit;
      console.log("page : ", page);
      console.log("skip : ", skip);

      const challenges = await ChallengeService.findChallenges( );
      //const { challenges, count } = await ChallengeService.findChallenges(skip, limit);
      res.status(OK).send({
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        challenges,
      });
    } catch (error) {
      next(error);
    }
  },

  challengeGet: async function (req, res, next) {
    try {
      const chllengeId = req.params._id;
      const challenge = await ChallengeService.findChallenge({ chllengeId });
      res.status(OK).send(challenge);
    } catch (error) {
      next(error);
    }
  },
  
  challengeUpdate: async function (req, res, next) {
    try {
      const chllengeId = req.params._id;
      const currentUserId = req.currentUserId;
      const { icon, title, content, weeks } = req.body;  
  
      const education = await ChallengeService.updateChallenge({ 
        chllengeId, currentUserId, title, content, icon, weeks, 
      });
      
      res.status(OK).send(education);
    } catch (error) {
      next(error);
    }
  },
  
  challengeDelete: async function (req, res, next){
    try {
      const chllengeId = req.params._id;
      const currentUserId = req.currentUserId;
      await ChallengeService.deleteChallenge(chllengeId, currentUserId);
       
      res.status(OK).send({ message: "challenge 삭제 완료"});
    } catch (error) {
      next(error);
    }
  }
}


export { challengeController }