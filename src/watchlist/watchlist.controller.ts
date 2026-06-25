import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';
import { ListWatchlistDto } from './dto/list-watchlist.dto';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  add(@Body() dto: CreateWatchlistItemDto) {
    return this.watchlistService.add(dto);
  }

  @Get()
  list(@Query() query: ListWatchlistDto) {
    return this.watchlistService.list(query.userId, query.type);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.watchlistService.remove(id);
  }
}
