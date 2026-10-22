import { PipelineStage } from 'mongoose';
import { ReportFoldersFilterDto } from '../dto/request/report-folders-filter.dto';

/** Helper to build the $match stage for folder queries */
export function buildFolderMatchStage(filter: ReportFoldersFilterDto,): PipelineStage.Match['$match'] {
  const match: Record<string, any> = { isDeleted: false };

  if (filter.search?.trim()) {
    match['name'] = { $regex: filter.search.trim(), $options: 'i' };
  }

  if (filter.dateFrom || filter.dateTo) {
    match['createdAt'] = {};
    if (filter.dateFrom) match['createdAt']['$gte'] = new Date(filter.dateFrom);
    if (filter.dateTo) match['createdAt']['$lte'] = new Date(filter.dateTo);
  }

  return match;
}
