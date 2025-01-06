import React from 'react';
import { Button } from './button';

interface ExampleProps {
  title: string;
  description?: string;
  onAction: () => void;
}

export function ExampleComponent({ title, description, onAction }: ExampleProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <Button onClick={onAction} className="w-full">
        Perform Action
      </Button>
    </div>
  );
}
