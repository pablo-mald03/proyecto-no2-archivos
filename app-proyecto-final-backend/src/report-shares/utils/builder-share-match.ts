import { PipelineStage } from 'mongoose';
import { ReportSharesFilterDto } from '../dto/request/report-shares-filter.dto';

/** Helper to build the $match stage for share-collection queries */
export function buildShareMatchStage(
  filter: ReportSharesFilterDto,
): PipelineStage.Match['$match'] {
  const match: Record<string, any> = {};

  if (filter.resourceType) {
    match['resourceType'] = filter.resourceType;
  }

  if (filter.dateFrom || filter.dateTo) {
    match['createdAt'] = {};
    if (filter.dateFrom) match['createdAt']['$gte'] = new Date(filter.dateFrom);
    if (filter.dateTo) match['createdAt']['$lte'] = new Date(filter.dateTo);
  }

  return match;
}

/** Helper to build the $match stage for file-collection queries */
export function buildFileMatchStage(
  filter: ReportSharesFilterDto,
): PipelineStage.Match['$match'] {
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
