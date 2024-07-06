import { authFormSchema } from '@/lib/utils'
import React from 'react'
import { Control, Field, FieldPath } from 'react-hook-form'
import { z } from 'zod'
import { FormControl, FormField, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

const formSchema = authFormSchema('sign-up')

interface CustomInputProps {
  control: Control<z.infer<typeof formSchema>>,
  name: FieldPath<z.infer<typeof formSchema>>,
  label: string,
  placeholder?: string,
  value?: string, // New
  disabled?: boolean, // New
}

const CustomInput = ({
  control,
  name,
  label,
  placeholder,
  value, // New
  disabled = false, // New with default value
}: CustomInputProps) => {

  return (
    <FormField  
      control={control}
      name={name}
      render={({ field }) => (
        <div className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <FormControl >
            <Input
              className="input-class"
              placeholder={!placeholder ? `Enter Your ${label}` : placeholder}
              type={name === 'password' ? 'password' : name === 'dateOfBirth' ? 'date' : 'text'}
              disabled={disabled} // New
              value={value ?? field.value} // Use the value prop, fallback to field.value
              onChange={field.onChange}
              {...field}
            />
          </FormControl>
          <FormMessage className="form-message mt-2" />
        </div>
      )}
    />
  )
}

export default CustomInput