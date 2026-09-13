import { Checkbox, Input, Textarea, formStyles } from '@/components/form/Field';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { contacts } from '@/content/site';
import type { FormBlock } from '@/content/compositions';
import s from './compositions.module.css';

/** Развёрнутый ответ — поле в несколько строк. */
function isLong(label: string): boolean {
  return label.length > 40;
}

/** Тип поля по его подписи: телефон набирают цифровой клавиатурой. */
function inputType(label: string): 'tel' | 'text' {
  return /телефон/i.test(label) ? 'tel' : 'text';
}

/**
 * Форма записи.
 *
 * На действующем сайте это форма Tilda с полями «Имя» и «Телефон» и
 * согласием на обработку данных. Атрибут `action` пустой: получатель заявок
 * задан в настройках проекта Tilda и в коде не виден. Пока получатель не
 * подтверждён (QUESTIONS.md, пункт B-3), отправку включать нельзя — ТЗ §13
 * прямо запрещает менять адресата заявок.
 *
 * Поэтому форма восстановлена визуально и отключена, а рядом стоит рабочий
 * способ связи: телефон школы. Заголовок, подводка и текст согласия
 * перенесены дословно.
 */
export function FormSection({ form }: { form: FormBlock }) {
  const phone = contacts.phones[0];

  return (
    <div className={s.form}>
      <div className={s.formText}>
        <h2 className={s.formTitle}>{form.title}</h2>
        {form.lead ? <p className={s.formLead}>{form.lead}</p> : null}

        {phone ? (
          <p className={s.formPhone}>
            <Icon name="phone" size={20} />
            <a href={`tel:${phone.tel}`}>{phone.display}</a>
          </p>
        ) : null}
      </div>

      <div className={s.formFields}>
        <fieldset className={s.formFieldset} disabled>
          <legend className={s.srOnly}>{form.title}</legend>

          <div className={formStyles.form}>
            {form.fields.map((label) =>
              isLong(label) ? (
                <Textarea key={label} label={label} rows={3} />
              ) : (
                <Input key={label} label={label} type={inputType(label)} />
              ),
            )}
            {form.consent ? <Checkbox name="consent">{form.consent}</Checkbox> : null}
            <Button variant="primary" type="submit" block>
              Отправить
            </Button>
          </div>
        </fieldset>

        <p className={s.formNote}>
          Отправка заявок пока не подключена: адресат заявок с действующего сайта не
          подтверждён. Запись на обучение — по телефону школы.
        </p>
      </div>
    </div>
  );
}
