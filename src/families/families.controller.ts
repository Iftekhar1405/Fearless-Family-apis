
import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { JoinFamilyDto } from './dto/join-family.dto';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  async createFamily(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familiesService.createFamily(createFamilyDto);
  }

  @Post('join')
  async joinFamily(@Body() joinFamilyDto: JoinFamilyDto) {
    return this.familiesService.joinFamily(joinFamilyDto);
  }

  @Get(':identifier')
  async getFamilyByCode(@Param('identifier') identifier: string) {
    return this.familiesService.getFamilyByCode(identifier);
  }

  // New endpoint to get family members
  @Get(':familyId/members')
  async getFamilyMembers(@Param('familyId') familyId: string) {
    return this.familiesService.getFamilyMembers(familyId);
  }
}


