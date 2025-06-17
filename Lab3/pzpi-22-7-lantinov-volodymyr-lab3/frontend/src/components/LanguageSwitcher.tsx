import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleChange = (event: any) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 100, ml: 2 }}>
      <InputLabel>{t('language')}</InputLabel>
      <Select
        value={i18n.language}
        label={t('language')}
        onChange={handleChange}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="ua">Українська</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher; 