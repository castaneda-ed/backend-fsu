const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

//import of the authentication to perform actions if the user is loged in
const { authenticate } = require("./auth");

// router.use();
router

  .get("/", async (req, res, next) => {
    try {
      const departments = await prisma.department.findMany();
      res.json(departments);
    } catch (e) {
      next(e);
    }
  })

  .get("/:id", async (req, res, next) => {
    const { id } = req.params;

    try {
      const department = await prisma.department.findUniqueOrThrow({
        where: { id: +id },
      });

      if (!department) {
        return next({
          status: 404,
          message: `Department with id ${id} does not exist.`,
        });
      }
      res.status(201).json(department);
    } catch (e) {
      next(e);
    }
  })

  .post("/", authenticate, async (req, res, next) => {
    const { name, description, image, info, professors } = req.body;
    const faculty = professors.map((id) => ({ id }));

    try {
      const department = await prisma.department.create({
        data: {
          name,
          description,
          image,
          info,
          faculty: { connect: faculty },
        },
      });
      res.status(201).json(department);
    } catch (e) {
      next(e);
    }
  })

  .delete("/:id", authenticate, async (req, res, next) => {
    const { id } = req.params;
    try {
      // Check if the department exists
      const department = await prisma.department.findUnique({
        where: { id: +id },
      });
      console.log(department);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      await prisma.professor.updateMany({
        where: { departmentId: +id },
        data: { departmentId: null },
      });

      // Delete the department
      await prisma.department.delete({ where: { id: +id } }); //may need to change
      // Respond with a success message
      res.status(204).send(); // 204 No Content
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

router.patch("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image, info, professorIds } = req.body;

  try {
    // Check if the department exists
    const department = await prisma.department.findUniqueOrThrow({
      where: { id: +id },
    });

    if (!department) {
      return next({ status: 404, message: "Department not found." });
    }

    const faculty = professorIds.map((id) => ({ id }));
    const updatedDepartment = await prisma.department.update({
      where: { id: +id },
      data: {
        name,
        description,
        image,
        info,
        faculty: { connect: faculty },
      },
      include: { faculty: true },
    });
    res.json(updatedDepartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

module.exports = router;
