// Проверка доступа при загрузке сайта
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли доступ
    const accessGranted = localStorage.getItem('accessGranted');
    const accessTimestamp = localStorage.getItem('accessTimestamp');
    
    // Если доступ не предоставлен или прошло больше 2 часов
    if (!accessGranted || !accessTimestamp || 
        (Date.now() - parseInt(accessTimestamp)) > 2 * 60 * 60 * 1000) {
        
        // Перенаправляем на страницу капчи
        window.location.href = 'index.html'; // Главная страница капчи
        return;
    }
    
    // Если доступ есть, продолжаем загрузку сайта
    console.log('Доступ разрешен. Загружаем основной сайт...');
    
    // Здесь может быть ваш оригинальный код инициализации
});