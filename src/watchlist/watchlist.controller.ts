import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
import { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';
import { ListWatchlistDto } from './dto/list-watchlist.dto';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() dto: CreateWatchlistItemDto) {
    return this.watchlistService.add(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListWatchlistDto) {
    return this.watchlistService.list(user.userId, query.type);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.watchlistService.remove(id, user.userId);
  }
}
