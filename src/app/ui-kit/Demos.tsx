'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Checkbox, FileInput, FormStatus, Input, Select, Textarea, formStyles } from '@/components/form/Field';
import s from './kit.module.css';

/** Демонстрация интерактивных состояний. Тексты — служебные примеры. */
export function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Открыть попап
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Пример заголовка попапа">
        <p>
          Закрытие работает по клавише Escape, клику по подложке и кнопке. Фокус остаётся внутри
          окна, после закрытия возвращается на кнопку-инициатор.
        </p>
        <Button variant="primary" onClick={() => setOpen(false)}>
          Понятно
        </Button>
      </Modal>
    </>
  );
}

export function FormDemo() {
  const [sent, setSent] = useState(false);

  return (
    <div className={s.panel}>
      <form
        className={formStyles.form}
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <div className={[formStyles.row, formStyles.row2].join(' ')}>
          <Input label="Имя и фамилия" placeholder="Например, Иванова Мария" required />
          <Input label="Телефон" type="tel" placeholder="+7 (___) ___-__-__" required />
        </div>

        <div className={[formStyles.row, formStyles.row2].join(' ')}>
          <Input
            label="Электронная почта"
            type="email"
            defaultValue="почта"
            error="Укажите адрес в формате name@example.ru"
          />
          <Select
            label="Класс"
            placeholder="Выберите из списка"
            options={[
              { value: '1', label: 'Пример значения 1' },
              { value: '2', label: 'Пример значения 2' },
              { value: '3', label: 'Пример значения 3' },
            ]}
          />
        </div>

        <Textarea label="Сообщение" hint="До 1000 символов" placeholder="Текст обращения" />

        <FileInput label="Приложение" buttonLabel="Выбрать файл" hint="PDF или JPG, до 10 МБ" />

        <Checkbox>
          Текст согласия на обработку персональных данных переносится с действующего сайта
          дословно и не редактируется.
        </Checkbox>

        <div className={formStyles.actions}>
          <Button type="submit" variant="primary" size="lg">
            Отправить
          </Button>
          <Button variant="ghost" onClick={() => setSent(false)}>
            Сбросить состояние
          </Button>
        </div>

        {sent ? (
          <FormStatus tone="success" title="Заявка отправлена">
            Текст подтверждения также берётся из текущей версии формы.
          </FormStatus>
        ) : null}
      </form>

      <div style={{ display: 'grid', gap: 'var(--s-3)', marginTop: 'var(--s-6)' }}>
        <FormStatus tone="error" title="Не удалось отправить">
          Проверьте обязательные поля и повторите попытку.
        </FormStatus>
        <FormStatus tone="info" title="Отправка…">
          Кнопка блокируется до получения ответа.
        </FormStatus>
      </div>
    </div>
  );
}
