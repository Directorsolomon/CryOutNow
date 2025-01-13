import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updatePreferences, MatchPreferences } from '@/store/slices/partnerMatchingSlice'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const DAYS_OF_WEEK = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
] as const

const TIMES_OF_DAY = [
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
] as const

const EXPERIENCE_LEVELS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Experienced', value: 'experienced' },
] as const

const formSchema = z.object({
  prayerTopics: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),
  availability: z.object({
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).min(1, 'Select at least one day'),
    timeOfDay: z.array(z.enum(['morning', 'afternoon', 'evening'])).min(1, 'Select at least one time of day'),
  }),
  preferredLanguages: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),
  denominationPreference: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'experienced']),
})

type FormValues = z.infer<typeof formSchema>

export default function PreferencesForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { preferences, loading } = useSelector((state: RootState) => state.partnerMatching)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prayerTopics: '',
      availability: {
        days: [],
        timeOfDay: [],
      },
      preferredLanguages: '',
      denominationPreference: '',
      experienceLevel: 'beginner',
    },
  })

  useEffect(() => {
    if (preferences) {
      form.reset({
        ...preferences,
        prayerTopics: preferences.prayerTopics.join(', '),
        preferredLanguages: preferences.preferredLanguages.join(', '),
      })
    }
  }, [preferences, form])

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(updatePreferences(data as MatchPreferences)).unwrap()
      toast({
        title: 'Success',
        description: 'Your prayer partner preferences have been updated',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update preferences',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="prayerTopics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prayer Topics</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter topics separated by commas (e.g., healing, peace, guidance)"
                />
              </FormControl>
              <FormDescription>
                List the prayer topics you're most interested in praying about with a partner
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="availability.days"
            render={() => (
              <FormItem>
                <FormLabel>Available Days</FormLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <FormField
                      key={day.value}
                      control={form.control}
                      name="availability.days"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                const value = field.value || []
                                return checked
                                  ? field.onChange([...value, day.value])
                                  : field.onChange(value.filter((val) => val !== day.value))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability.timeOfDay"
            render={() => (
              <FormItem>
                <FormLabel>Preferred Times</FormLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIMES_OF_DAY.map((time) => (
                    <FormField
                      key={time.value}
                      control={form.control}
                      name="availability.timeOfDay"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(time.value)}
                              onCheckedChange={(checked) => {
                                const value = field.value || []
                                return checked
                                  ? field.onChange([...value, time.value])
                                  : field.onChange(value.filter((val) => val !== time.value))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {time.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="preferredLanguages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Languages</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter languages separated by commas (e.g., English, Spanish)"
                />
              </FormControl>
              <FormDescription>
                List the languages you're comfortable praying in
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="denominationPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Denomination Preference (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your preferred denomination"
                />
              </FormControl>
              <FormDescription>
                Leave blank if you're open to all denominations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prayer Experience Level</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Save Preferences'
          )}
        </Button>
      </form>
    </Form>
  )
} 
