import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const artisans = await prisma.artisan.findMany()
  if (artisans.length === 0) {
    console.log('Aucun artisan trouvé.')
    return
  }

  const artisan = artisans[0]
  await prisma.artisan.update({
    where: { id: artisan.id },
    data: { photoCouverture: 'http://localhost:3000/images/kossou.jpg' }
  })

  console.log(`✅ Photo mise à jour pour : ${artisan.nomBoutique}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
