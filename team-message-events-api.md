# OSU Events API Analysis & Recommendations

**To**: Software Development Team  
**From**: Development Analysis  
**Date**: October 27, 2025  
**Subject**: Events Section Enhancement - API Capacity & Performance Optimization

## Current Status

Our events integration is successfully pulling real OSU events from two APIs:
- **Main Campus API**: `events.okstate.edu/api/2/events`
- **Extension API**: `ag-events.okstate.edu/api/2/events`

**Current Performance**:
- ✅ 20 total events displayed (10 from each API)
- ✅ Real-time data with 30-minute caching
- ✅ Category filtering working (Academic, Athletics, Community, etc.)
- ✅ Date filtering (Today, Upcoming, All)

## API Capacity Discovery

Through testing, we've discovered significant untapped capacity:

### Current Limitations
- **Hard limit**: 10 events per API request (regardless of `num` parameter)
- **Current fetch**: 1 page from each API = 20 total events

### Available Capacity
- **Main Campus**: 62 pages available (~620 potential events)
- **Extension**: 23 pages available (~230 potential events)
- **Total Available**: 85 pages (~850 potential events)

### Pagination Testing Results
```javascript
// Current: Single page requests
fetch('events.okstate.edu/api/2/events?days=60&num=50') // Returns only 10 events

// Discovery: Pagination works
fetch('events.okstate.edu/api/2/events?days=60&page=2') // Returns 10 different events
fetch('events.okstate.edu/api/2/events?days=60&page=3') // Returns 10 more different events
```

## Business Impact Analysis

### Current User Experience Issues
- **Limited Today Events**: Often 0-2 events for "Today" filter
- **Sparse Categories**: Some categories show very few events
- **Reduced Engagement**: Users may not find relevant events

### Potential Improvements with More Events
- **Better Filtering**: More meaningful category breakdowns
- **Increased Relevance**: Higher chance of finding today's/tomorrow's events
- **User Engagement**: More content variety and discovery

## Technical Recommendations

### Option 1: Conservative Expansion (Recommended)
```javascript
// Fetch 3 pages from each API = 60 total events
const mainPages = await Promise.all([1,2,3].map(page => 
  fetch(`https://events.okstate.edu/api/2/events?days=60&page=${page}`)
))
const extPages = await Promise.all([1,2,3].map(page => 
  fetch(`https://ag-events.okstate.edu/api/2/events?days=60&page=${page}`)
))
```

**Performance Impact**:
- **API Calls**: 2 → 6 requests (3x increase)
- **Cache Size**: ~20 events → ~60 events
- **Loading Time**: ~500ms → ~800ms estimated
- **Benefits**: 3x more events, better filtering

### Option 2: Aggressive Expansion
```javascript
// Fetch 5-10 pages = 100-200 total events
```
**Trade-offs**: Much more data, longer load times, potential API rate limiting

### Option 3: Smart Pagination
```javascript
// Fetch pages 1-2 immediately, load page 3+ on-demand
// or based on user interaction with filters
```

## Implementation Strategy

### Phase 1: Infrastructure (Immediate)
1. **Multi-page fetching** capability
2. **Enhanced caching** for larger datasets
3. **Loading states** for multiple API calls
4. **Error handling** for partial failures

### Phase 2: Performance Optimization
1. **Parallel requests** (already planned)
2. **Smart caching** (cache individual pages)
3. **Background refresh** for subsequent pages
4. **Rate limiting** protection

### Phase 3: User Experience
1. **Progressive loading** (show first 20, load more in background)
2. **"Show More"** button option
3. **Category-based loading** (load more events for selected categories)

## Risk Assessment

### Low Risk
- **API Stability**: OSU APIs are stable, publicly documented
- **Data Quality**: Consistent schema across pages
- **Caching**: Our 30-minute cache handles the extra data fine

### Medium Risk
- **Load Performance**: 6 simultaneous API calls vs current 2
- **Rate Limiting**: Unknown if OSU has request limits per minute/hour

### Mitigation Strategies
- **Graceful Degradation**: Fall back to single page if multi-page fails
- **Request Spacing**: Add small delays between page requests if needed
- **Monitoring**: Track API response times and error rates

## Recommendation

**Implement Option 1 (Conservative Expansion)** with the following approach:

1. **Week 1**: Implement 3-page fetching infrastructure
2. **Week 2**: Deploy and monitor performance metrics
3. **Week 3**: Evaluate user engagement and consider further expansion

**Expected Outcomes**:
- 📈 **3x more events** available for filtering
- 🎯 **Better "Today" results** (higher chance of current events)
- 📊 **Meaningful categories** (each category likely to have multiple events)
- ⚡ **Acceptable performance** impact (~300ms additional load time)

## Next Steps

Please review and provide feedback on:
1. **Performance tolerance**: Is ~800ms total load time acceptable?
2. **Implementation priority**: Should this be next sprint or can it wait?
3. **Monitoring requirements**: What metrics should we track post-deployment?
4. **Rollback plan**: Comfort level with reverting if issues arise?

**Technical Lead Approval Needed**: Multi-page API implementation  
**QA Coordination**: Performance testing with 60 events vs 20 events  
**Deployment**: Requires cache invalidation due to data structure changes

---

*This analysis is based on live API testing performed on October 27, 2025. API capacity numbers may change as OSU adds/removes events.*