import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Populando banco de dados simplificado IHQ...');

  await prisma.movement.deleteMany();
  await prisma.order.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.reagent.deleteMany();

  const reagentsData = [
    {
      name: 'Ki-67',
      clone: 'MIB-1',
      code: 'IR626',
      manufacturer: 'Dako / Agilent',
      volume: '6 mL',
      unit: 'ML',
      monthlyConsumption: 6,
      minStock3Months: 18,
      currentStock: 18,
    },
    {
      name: 'CD20',
      clone: 'L26',
      code: 'IR604',
      manufacturer: 'Dako / Agilent',
      volume: '6 mL',
      unit: 'ML',
      monthlyConsumption: 4,
      minStock3Months: 12,
      currentStock: 5,
    },
    {
      name: 'Cromógeno DAB EnVision FLEX',
      clone: 'N/A (Kit)',
      code: 'K8000',
      manufacturer: 'Dako / Agilent',
      volume: '400 testes',
      unit: 'TESTS',
      monthlyConsumption: 200,
      minStock3Months: 600,
      currentStock: 150,
    },
    {
      name: 'CK7 (Citoqueratina 7)',
      clone: 'SP52',
      code: '790-4462',
      manufacturer: 'Roche',
      volume: '50 testes',
      unit: 'TESTS',
      monthlyConsumption: 40,
      minStock3Months: 120,
      currentStock: 50,
    },
    {
      name: 'HER2 / neu',
      clone: '4B5',
      code: '790-2991',
      manufacturer: 'Roche',
      volume: '50 testes',
      unit: 'TESTS',
      monthlyConsumption: 30,
      minStock3Months: 90,
      currentStock: 20,
    },
    {
      name: 'Receptor de Estrogênio (ER)',
      clone: 'SP1',
      code: '790-4324',
      manufacturer: 'Roche',
      volume: '50 testes',
      unit: 'TESTS',
      monthlyConsumption: 35,
      minStock3Months: 105,
      currentStock: 110,
    },
  ];

  for (const item of reagentsData) {
    await prisma.reagent.create({ data: item });
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
