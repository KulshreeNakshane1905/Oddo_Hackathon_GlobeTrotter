// ============================================================================
// Database Seeder — Populates cities and activities from JSON files
// ============================================================================

import { PrismaClient, ActivityType } from '@prisma/client';
import citiesData from '../data/cities.json';
import activitiesData from '../data/activities.json';

const prisma = new PrismaClient();

interface CityData {
  name: string;
  country: string;
  countryCode: string;
  costIndex: number;
  popularityScore: number;
  latitude: number;
  longitude: number;
  timezone: string;
  imageUrl: string;
}

interface ActivityData {
  name: string;
  description: string;
  type: string;
  avgCost: number;
  durationHours: number;
  cityName: string;
  imageUrl: string;
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // ── Seed Cities ──────────────────────────────────────────────────────────
  console.log(`📍 Seeding ${citiesData.length} cities...`);

  const cityMap = new Map<string, string>(); // name -> id

  for (const city of citiesData as CityData[]) {
    const existing = await prisma.city.findFirst({
      where: { name: city.name, countryCode: city.countryCode },
    });

    if (existing) {
      cityMap.set(city.name, existing.id);
      continue;
    }

    const created = await prisma.city.create({
      data: {
        name: city.name,
        country: city.country,
        countryCode: city.countryCode,
        costIndex: city.costIndex,
        popularityScore: city.popularityScore,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
        imageUrl: city.imageUrl,
      },
    });

    cityMap.set(city.name, created.id);
  }

  console.log(`✅ Cities seeded: ${cityMap.size}\n`);

  // ── Seed Activities ──────────────────────────────────────────────────────
  console.log(`🎯 Seeding ${activitiesData.length} activities...`);

  let activityCount = 0;

  for (const activity of activitiesData as ActivityData[]) {
    const cityId = cityMap.get(activity.cityName);

    if (!cityId) {
      console.warn(`  ⚠️  Skipping "${activity.name}" — city "${activity.cityName}" not found`);
      continue;
    }

    const existing = await prisma.activity.findFirst({
      where: { name: activity.name, cityId },
    });

    if (existing) {
      continue;
    }

    // Map string type to ActivityType enum
    const activityType = (activity.type as keyof typeof ActivityType) || 'OTHER';

    await prisma.activity.create({
      data: {
        name: activity.name,
        description: activity.description,
        type: activityType as ActivityType,
        avgCost: activity.avgCost,
        durationHours: activity.durationHours,
        cityId,
        imageUrl: activity.imageUrl,
      },
    });

    activityCount++;
  }

  console.log(`✅ Activities seeded: ${activityCount}\n`);
  console.log('🎉 Database seed complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
