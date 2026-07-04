import { Router } from "express";
import subjectController from "../controllers/subjectController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import subjectValidators from "../validations/subjectValidators.js";

const router = Router();

router.get("/", authMiddleware, subjectController.getSubjects);
router.post(
  "/",
  authMiddleware,
  validate(subjectValidators.addSubject),
  subjectController.addSubject,
);
router.delete("/:id", authMiddleware, subjectController.deleteSubject);
router.put(
  "/:id",
  authMiddleware,
  validate(subjectValidators.updateSubject),
  subjectController.updateSubject,
);

export default router;
