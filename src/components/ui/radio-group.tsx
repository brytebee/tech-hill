// components/ui/radio-group.tsx
import * as Radio from "@radix-ui/react-radio-group";

interface RadioGroupItem {
  value: string;
  label: string;
}

interface RadioGroupProps {
  items: RadioGroupItem[];
  value: string;
  onChange: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ items, value, onChange }) => {
  return (
    <Radio.Root
      value={value}
      onValueChange={onChange}
      className="flex flex-col gap-2"
    >
      {items.map((item) => (
        <Radio.Item
          key={item.value}
          value={item.value}
          className="flex items-center gap-2"
        >
          <Radio.Indicator className="w-4 h-4 bg-blue-600 rounded-full" />
          {item.label}
        </Radio.Item>
      ))}
    </Radio.Root>
  );
};

export { RadioGroup };

/*```
tsx
import { RadioGroup } from '@/components/ui/radio-group';

const QuizInterface = () => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
  };

  const radioGroupItems = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <div>
      <RadioGroup
        items={radioGroupItems}
        value={selectedValue}
        onChange={handleRadioChange}
      />
    </div>
  );
};
```*/
