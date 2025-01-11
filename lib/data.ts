// lib/data.ts
import { prisma } from "./prisma";
import { cache } from 'react'
import { z } from 'zod'

export const courseQuerySchema = z.object({
  department: z.array(z.string()).optional(),
  sbc: z.array(z.string()).optional(),
  search: z.string().optional(),
});

export const getCourses = cache(async (params: z.infer<typeof courseQuerySchema>) => {
  const courses = await prisma.courses.findMany({
    where: {
      AND: [
        params.department && params.department.length > 0 
          ? { Department: {in: params.department}} 
          : {},
        params.sbc && params.sbc.length > 0 
          ? { SBCs: { hasEvery: params.sbc } } 
          : {},
        params.search 
          ? {
              OR: [
                { Title: { contains: params.search, mode: 'insensitive' } },
                { Course_Number: { contains: params.search, mode: 'insensitive' } },
                { Description: { contains: params.search, mode: 'insensitive' } },
                { SBCs: { hasEvery: [params.search] } },
              ]
            } 
          : {}
      ]
    }, 
    orderBy: {
      Course_Number: 'asc'
    },
  });
  
  return courses;
});

export async function getDepartments() {
  const courses = await prisma.courses.findMany({
    select: {
      Department: true,
    },
    orderBy: {
      Department: 'asc',
    }
  });

  const flattenedDepartments = courses.flatMap(course => course.Department);
  return [...new Set(flattenedDepartments)];
}

export async function getSBCs() {
  const courses = await prisma.courses.findMany({
    select: {
      SBCs: true
    },
    orderBy:{
      SBCs: 'asc'
    }
  });

  const flattenedSBCs = courses.flatMap(course => course.SBCs);
  return [...new Set(flattenedSBCs)];
}