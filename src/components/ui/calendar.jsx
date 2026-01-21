import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

// Uma versão simplificada do componente Calendar sem a dependência react-day-picker
function Calendar({
  className,
  month,
  onMonthChange,
  selected,
  onSelect,
  disabled,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(month || new Date());
  const [selectedDate, setSelectedDate] = React.useState(selected);

  React.useEffect(() => {
    if (selected) {
      setSelectedDate(selected);
    }
  }, [selected]);

  React.useEffect(() => {
    if (month) {
      setCurrentMonth(month);
    }
  }, [month]);

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (onSelect) {
      onSelect(date);
    }
  };

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarCells = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    // Dias do mês anterior para preencher a primeira semana
    const prevMonthDays = [];
    for (let i = 0; i < firstDay; i++) {
      prevMonthDays.push(null);
    }
    
    // Dias do mês atual
    const days = [];
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Combinar dias anteriores e atuais
    const allDays = [...prevMonthDays, ...days];
    
    // Organizar em semanas
    const weeks = [];
    let week = [];
    
    allDays.forEach((day, index) => {
      week.push(day);
      if (week.length === 7 || index === allDays.length - 1) {
        weeks.push(week);
        week = [];
      }
    });
    
    return weeks;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weeks = generateCalendarCells();

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex justify-between items-center mb-4">
        <Button
          type="button"
          variant="outline"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Mês anterior</span>
        </Button>
        
        <h2 className="text-sm font-medium">
          {`${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
        </h2>
        
        <Button
          type="button"
          variant="outline"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próximo mês</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayNames.map((day, index) => (
          <div key={index} className="text-xs font-medium text-gray-500 mb-1">
            {day}
          </div>
        ))}
        
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => (
              <div key={dayIndex} className="p-0">
                {day ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 p-0 font-normal rounded-full",
                      isToday(day) && "bg-gray-100",
                      isSelected(day) && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
                      !isSelected(day) && "text-gray-900 hover:bg-gray-100"
                    )}
                    disabled={disabled && disabled(day)}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day.getDate()}
                  </Button>
                ) : (
                  <div className="h-8 w-8" />
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
export default Calendar;