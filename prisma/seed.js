const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

const seed = async (numDepartments = 5, numProfessors = 20) => {
  const departments = [];

  // Create Departments
  for (let i = 0; i < numDepartments; i++) {
    const department = await prisma.department.create({
      data: {
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        image: faker.image.urlPicsumPhotos(),
        info: faker.lorem.paragraph(),
      },
    });
    departments.push(department);
  }

  // Create Professors and assign to random departments
  for (let i = 0; i < numProfessors; i++) {
    const randomDepartment =
      departments[Math.floor(Math.random() * departments.length)];

    await prisma.professor.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        bio: faker.lorem.paragraph(),
        image: faker.image.avatar(),
        department: {
          connect: { id: randomDepartment.id },
        },
      },
    });
  }
};

seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
