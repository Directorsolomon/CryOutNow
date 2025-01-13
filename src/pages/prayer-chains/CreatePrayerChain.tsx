import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AppDispatch } from "@/store"
import { createPrayerChain } from "@/store/slices/prayerChainsSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  maxParticipants: z.number().min(2, "Must have at least 2 participants").max(10, "Maximum 10 participants"),
  turnDurationDays: z.number().min(1, "Turn duration must be at least 1 day").max(7, "Maximum 7 days"),
})

type FormData = z.infer<typeof formSchema>

export default function CreatePrayerChain() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxParticipants: 5,
      turnDurationDays: 1,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(createPrayerChain(data)).unwrap()
      toast({
        title: "Success",
        description: "Prayer chain created successfully",
      })
      navigate("/prayer-chains")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create prayer chain. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Prayer Chain</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter prayer chain title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the purpose of this prayer chain"
              rows={4}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium mb-2">
                Maximum Participants
              </label>
              <Input
                id="maxParticipants"
                type="number"
                {...register("maxParticipants", { valueAsNumber: true })}
                min={2}
                max={10}
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-500">{errors.maxParticipants.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="turnDurationDays" className="block text-sm font-medium mb-2">
                Turn Duration (Days)
              </label>
              <Input
                id="turnDurationDays"
                type="number"
                {...register("turnDurationDays", { valueAsNumber: true })}
                min={1}
                max={7}
              />
              {errors.turnDurationDays && (
                <p className="mt-1 text-sm text-red-500">{errors.turnDurationDays.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/prayer-chains")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Prayer Chain"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 
