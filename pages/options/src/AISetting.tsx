import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AI_PROVIDER, RECOMMENDED_MODEL_BY_PROVIDER } from '@extension/storage';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/lib/components/ui/form';
import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Button } from '@/lib/components/ui/button';

export const formSchema = z.object({
  provider: z.enum(AI_PROVIDER),
  apiKey: z.string().min(2),
  baseUrl: z.string().optional(),
  modelName: z.string(),
  defaultPrompt: z.string().optional(),
});

interface AISettingProps {
  defaultValues: z.infer<typeof formSchema>;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export const AISetting: React.FC<AISettingProps> = ({ defaultValues, onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const selectedProvider = form.watch('provider');

  const handleFillRecommendedModel = () => {
    if (selectedProvider) {
      const recommendedModel = RECOMMENDED_MODEL_BY_PROVIDER[selectedProvider];
      if (recommendedModel) {
        form.setValue('modelName', recommendedModel);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="baseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base URL</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="modelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Name</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input type="text" {...field} />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFillRecommendedModel}
                    disabled={!selectedProvider}
                    className="whitespace-nowrap">
                    Fill Recommended
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Prompt</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter default prompt (e.g., 'Fix grammar and improve clarity')" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};
