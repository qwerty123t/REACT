import './AddUserPopover.styles.less';
import { Card, Form } from 'antd';
import React, { useState, useRef, useMemo } from 'react';
import { Tooltip, Alert, Button, IconPlus, Input, Radio, Select, Table } from '@adtech/ui';
import { useAssignRoleMutation, PermissionEnum, ResourceEnum } from '@common/api/go.api';
import { AccountType } from '@features/auth/dto/GetTDAccountDTO';
import { useAppDispatch, useAppSelector } from '@src/store';
import SBAFormItem from '../../../../components/SBAFormItem/SBAFormItem';
import SBAInput from '../../../../components/SBAInput/SBAInput';
import SBATooltip from '@components/SBATooltip/SBATooltip';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NoneIcon from '../../../../assets/SVG/components/none.svg';
import TickIcon from '../../../../assets/SVG/components/tick.svg';
import CloseIcon from '../../../../assets/SVG/components/close.svg';

export const AddUserPopover = () => {
    // POPUP для кнопки Добавить по адресу http://localhost:4000/advAccount/users


const dataSource = [
    {
        key: '1',
        first: (
            <>
                <p className="strong-small-text">Управление рекламой</p>
                <p>Cоздание, редактирование, удаление кампаний, групп и объявлений</p>
            </>
        ),
        second: <NoneIcon />,
        third: <TickIcon />,
        fourth: <TickIcon />,
    },
    {
        key: '2',
        first: 'Просмотр данных рекламных кампаний, групп и объявлений',
        second: <TickIcon />,
        third: <TickIcon />,
        fourth: <TickIcon />,
    },
    {
        key: '3',
        first: (
            <>
                <p className="strong-small-text">Статистика и отчёты</p>
                <p>Просмотр готовых отчётов</p>
            </>
        ),
        second: <TickIcon />,
        third: <TickIcon />,
        fourth: <TickIcon />,
    },
    {
        key: '4',
        first: 'Создание и выгрузка кастомных отчётов',
        second: <NoneIcon />,
        third: <TickIcon />,
        fourth: <TickIcon />,
    },
    {
        key: '5',
        first: (
            <>
                <p className="strong-small-text">Пользователи</p>
                <p>Добавление, изменение роли</p>
            </>
        ),
        second: <NoneIcon />,
        third: <NoneIcon />,
        fourth: <TickIcon />,
    },
    {
        key: '6',
        first: (
            <>
                <p className="strong-small-text">Платежи</p>
                <p>Просмотр баланса</p>
            </>
        ),
        second: <TickIcon />,
        third: <TickIcon />,
        fourth: <TickIcon />,
    },
    {
        key: '7',
        first: 'Пополнение баланса аккаунта',
        second: <NoneIcon />,
        third: <TickIcon />,
        fourth: <TickIcon />,
    },
    {
        key: '8',
        first: 'Просмотр финансовых документов',
        second: <NoneIcon />,
        third: <NoneIcon />,
        fourth: <TickIcon />,
    },
    {
        key: '9',
        first: '',
        second: '',
        third: '',
        fourth: '',
    },
];

const dataSourceForAgency = [
    {
        key: '1',
        first: (
            <>
                <p className="strong-small-text">Клиенты</p>
                <p>Cоздание клиента и изменение данных по нему</p>
            </>
        ),
        second: <NoneIcon />,
        third: <TickIcon />,
    },
    {
        key: '2',
        first: 'Доступ к рекламным компаниям',
        second: (
            <>
                <TickIcon />
                <p>только назначенные клиенты</p>
            </>
        ),
        third: <TickIcon />,
    },
    {
        key: '3',
        first: (
            <>
                <p className="strong-small-text">Отчёты</p>
                <p>Просмотр, создание и выгрузка</p>
            </>
        ),
        second: (
            <>
                <TickIcon />
                <p>только назначенные клиенты</p>
            </>
        ),
        third: <TickIcon />,
    },
    {
        key: '4',
        first: (
            <>
                <p className="strong-small-text">Пользователи</p>
                <p>Добавление и назначение клиента</p>
            </>
        ),
        second: <NoneIcon />,
        third: <TickIcon />,
    },
    {
        key: '5',
        first: (
            <>
                <p className="strong-small-text">Платежи</p>
                <p>Пополнение счёта</p>
            </>
        ),
        second: <NoneIcon />,
        third: <TickIcon />,
    },
    {
        key: '6',
        first: 'Просмотр финансовых документов',
        second: <NoneIcon />,
        third: <TickIcon />,
    },
];

const columns = [
    {
        dataIndex: 'first',
        key: 'name',
        className: 'firstColumn',
    },
    {
        dataIndex: 'second',
        key: 'manager read',
    },
    {
        dataIndex: 'third',
        key: 'manager',
    },
    {
        dataIndex: 'fourth',
        key: 'admin',
    },
];

const columnsForAgency = [
    {
        dataIndex: 'first',
        key: 'name',
        className: 'firstColumn',
    },
    {
        dataIndex: 'second',
        key: 'manager read',
    },
    {
        dataIndex: 'third',
        key: 'manager',
    },
];

const popover = useRef<HTMLElement>(null);
const canTopManageRole = PermissionEnum.MANAGE_TOP_USER_ROLE;
const selectedAccount = useAppSelector((state) => state.auth.selectedAccount);
const isAgency = selectedAccount?.type === AccountType.AGENCY;
//const isAgency = true;

const [assignRole, { isError, isLoading, isSuccess, isUninitialized }] = useAssignRoleMutation();
const [isError400or5xx, setIsError400or5xx] = useState(false);
const [isUserAdded, setIsUserAdded] = useState(false);

const { values, setFieldValue, errors, setErrors, handleSubmit } = useFormik<any>({
    initialValues: {
        login: '',
        role: '',
        isReassign: false,
    },
    validationSchema: Yup.object({
        login: Yup.string()
            .email('Введите валидный адрес электронной почты')
            .max(255, 'Максимальная длина эл.почты не должна превышать 255 символов')
            .required('Введите адрес электронной почты'),
        role: Yup.string()
            .required('Выберите роль'),
        isReassign: Yup.boolean(),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (formValues) => { 
        try {
            await assignRole(formValues).unwrap();
        } catch (response: any) {
            const regex = /^5/;
            if (response.data.status === 204) {
                setIsUserAdded(true);
                popover.current?.hidePopover();
            } else if (response.data.status === 400) {
                setIsError400or5xx(true);
                popover.current?.hidePopover();
            } else if (response.data.status === 404) {
                setErrors({login: 'Пользователь с указанной электронной почтой не найден'});
            } else if (response.data.status === 409) {
                setErrors({login: 'У пользователя уже есть роль в данном аккаунте'});
            } else if (regex.test(response.data.status)) {
                // если код ошибки 5хх
                setIsError400or5xx(true);
                popover.current?.hidePopover();
            }
        }
    },
});

const onChangeInputValue = (login: string) => (e: any) => setFieldValue(login, e.target.value);
const onChangeRadioButton = (e: any) => setFieldValue('role', e.target.value); 

return (
    <>
        {isError400or5xx && (
            <Alert message={'Возникла непредвиденная ошибка. Мы уже работаем над этим'} type="error" showIcon />
        )}
        {isUserAdded && (
            <Tooltip
                customClose
                defaultOpen
                placement="topRight"
                title="Вы добавили пользователя в роли менеджера. Теперь вы можете назначить ему клиентов"
            ></Tooltip>
        )}

        <section id="add-user-popover" ref={popover} className="add-user-popover" popover="auto">
            <div className="header">
                <h2>Добавление пользователя</h2>
                <button popovertarget="add-user-popover" popovertargetaction="hide">
                    <CloseIcon />
                </button>
            </div>

            <div className="content">
                <p className="email">E-mail пользователя</p>
                <Form onSubmitCapture={handleSubmit}>
                    <SBAFormItem>
                        <SBAInput
                            name="login"
                            placeholder="Введите электронный адрес"
                            value={values.login}
                            status={Object.keys(errors).length > 0  ? 'error' : undefined}
                            errorText={errors.login ? errors.login : errors.role}
                            onChange={onChangeInputValue('login')}
                        />
                    </SBAFormItem>
                </Form>

                <div className="radio">
                    <p className={isAgency && 'isAgency'}>Роли</p>
                    <Radio.Group onChange={onChangeRadioButton}>
                        {!isAgency && (
                            <Radio value={'MANAGER_READ'} className="radio-button">
                                <div className={values.role === 'MANAGER_READ' && 'bg-blue'}>
                                    <span className="manager-read">Менеджер</span>
                                </div>
                            </Radio>
                        )}
                        <Radio value={'MANAGER_WRITE'} className="radio-button">
                            <span className={
                            (values.role === 'MANAGER_WRITE' && isAgency ? 'bg-blue-agency' : (values.role === 'MANAGER_WRITE' ? 'bg-blue' : ''))}>
                                Менеджер
                            </span>
                        </Radio>
                        <Radio value={'ADMIN'} disabled={!canTopManageRole} className="radio-button">
                            <span className={
                            (values.role === 'ADMIN' && isAgency ? 'bg-blue-agency' : (values.role === 'ADMIN' ? 'bg-blue' : ''))}>
                                Администратор
                            </span>
                        </Radio>
                    </Radio.Group>
                </div>

                <Table
                    dataSource={isAgency ? dataSourceForAgency : dataSource}
                    columns={isAgency ? columnsForAgency : columns}
                    pagination={false}
                />
            </div>

            <div className="footer">
                <Button popovertarget="add-user-popover" popovertargetaction="hide" size="large" type="dashed">
                    Отменить
                </Button>
                <Button onClick={handleSubmit} size="large" type="default">
                    Добавить пользователя
                </Button>
            </div>
        </section>
    </>
);