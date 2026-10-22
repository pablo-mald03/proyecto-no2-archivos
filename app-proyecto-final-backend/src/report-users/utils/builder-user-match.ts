import { PipelineStage } from "mongoose";
import { ReportUsersFilterDto } from "../dto/request/report-users-filter.dto";

/*Helper to build the $match stage filtering users by search/dates*/
export function buildUserMatchStage(filter: ReportUsersFilterDto): PipelineStage.Match['$match'] {
    const match: Record<string, any> = { isActive: true };

    if (filter.search?.trim()) {
        const regex = { $regex: filter.search.trim(), $options: 'i' };
        match['$or'] = [{ username: regex }, { email: regex }];
    }

    if (filter.dateFrom || filter.dateTo) {
        match['createdAt'] = {};
        if (filter.dateFrom) match['createdAt']['$gte'] = new Date(filter.dateFrom);
        if (filter.dateTo) match['createdAt']['$lte'] = new Date(filter.dateTo);
    }

    return match;
}