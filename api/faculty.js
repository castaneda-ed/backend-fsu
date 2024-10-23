const express = require("express");
const router = express.Router();
module.exports = router;

const { authenticate } = require("./auth");
const prisma = require("../prisma");

// Get the list of all professors (faculty)
router.get("/", async (req, res, next) => {
  try {
    const faculty = await prisma.professor.findMany();
    res.json(faculty);
  } catch (error) {
    next(error);
  }
});

// Get the data for a single professor
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const professor = await prisma.professor.findUnique({
      where: { id: +id },
    });

    if (!professor) {
      return next({
        status: 404,
        message: `Professor with id ${id} does not exist.`,
      });
    }

    res.json(professor);
  } catch (error) {
    next(error);
  }
});

// Create a new professor
router.post("/", authenticate, async (req, res, next) => {
  const { name, email, bio, image, department } = req.body;
  try {
    //const department1 = department.map((id) => ({ id }));
    const professor = await prisma.professor.create({
      data: {
        name,
        email,
        bio,
        image,
        departmentId: department,
      },
    });
    res.status(201).json(professor);
  } catch (error) {
    next(error);
  }
});

// Deletes the selected professor. User must be logged in to do this.
router.delete("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const professor = await prisma.professor.findUnique({ where: { id: +id } });
    if (!professor) {
      return next({
        status: 404,
        message: `Professor with id ${id} does not exist.`,
      });
    }
    await prisma.professor.delete({ where: { id: +id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// Update a professor's info
router.patch("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { name, email, bio, image, departmentId } = req.body;

  try {
    const professor = await prisma.professor.findUnique({ where: { id: +id } });

    if (!professor) {
      return next({
        status: 404,
        message: `Professor with id ${id} does not exist.`,
      });
    }
    const updatedProfessor = await prisma.professor.update({
      where: { id: +id },
      data: {
        name,
        email,
        bio,
        image,
        departmentId,
      },
    });
    res.json(updatedProfessor);
  } catch (error) {
    next(error);
  }
});
