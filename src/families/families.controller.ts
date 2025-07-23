import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { JoinFamilyDto } from './dto/join-family.dto';
import { FilterQuery } from 'mongoose';
import { FamilyDocument } from './schemas/family.schema';

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

  @Get(':code')
  async getFamilyByCode(@Param('code') code: string) {
    return this.familiesService.getFamilyByCode(code);
  }
}