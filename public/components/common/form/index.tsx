import React from 'react';
import { IInputForm } from './types';
import { InputFormEditor } from './input_editor';
import { InputFormNumber } from './input_number';
import { InputFormText } from './input_text';
import { InputFormSwitch } from './input_switch';
import { InputFormSelect } from './input_select';
import { useFormFieldChanged } from './hooks';
import {
	EuiFormRow,
} from '@elastic/eui';

export const InputForm = (props: IInputForm) => {
  const { field, label = null, initialValue, onChange: onChangeInputForm, preInput = null, postInput = null } = props;
  const { value, error, onChange } = useFormFieldChanged(
    field.key,
    initialValue,
    { validate: field?.validate, onChange: onChangeInputForm, type: field.type, transformUIInputValue: field?.transformUIInputValue }
  );

  const ComponentInput = Input[field.type];

  if(!ComponentInput){
    return null;
  };

  const isInvalid = Boolean(error);

  const input = (
    <ComponentInput
      {...props}
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
      field={field}
    />
  );

  return label
    ? (
      <EuiFormRow label={label} fullWidth isInvalid={isInvalid} error={error}>
        <>
          {typeof preInput === 'function' ? preInput({value, error}) : preInput}
          {input}
          {typeof postInput === 'function' ? postInput({value, error}) : postInput}
        </>
      </EuiFormRow>)
    : input;    

};  

const Input = {
  switch: InputFormSwitch,
  editor: InputFormEditor,
  number: InputFormNumber,
  select: InputFormSelect,
  text: InputFormText,
};
