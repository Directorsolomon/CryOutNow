import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { setFilters, setSortBy } from '@/store/slices/prayerFeedSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COMMON_TAGS = [
  'Healing',
  'Family',
  'Guidance',
  'Peace',
  'Strength',
  'Faith',
  'Work',
  'Relationships',
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'prayers', label: 'Most Prayers' },
  { value: 'comments', label: 'Most Comments' },
]

export default function PrayerFeedFilters() {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedTags, sortBy } = useSelector((state: RootState) => state.prayerFeed)

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    dispatch(setFilters({ selectedTags: newTags }))
  }

  const handleSortChange = (value: string) => {
    dispatch(setSortBy(value))
  }

  return (
    <div className="space-y-4 p-4 bg-background border rounded-lg">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Filter by Tags</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sort By</h3>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(selectedTags.length > 0) && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(setFilters({ selectedTags: [] }))}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
} 