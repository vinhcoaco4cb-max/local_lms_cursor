/**
 * QUIZZES/HOTSPOT.JS — Логика для тестов с кликом по изображению
 * Добавлены режимы "множественный выбор" и "последовательность"
 */
QuizTypes.Hotspot = {
    render(question) {
        let instructions = 'Кликните на правильную область изображения';
        if (question.type === 'hotspot-multiple') {
            instructions = 'Отметьте все правильные области на изображении';
        } else if (question.type === 'hotspot-sequence') {
            instructions = 'Кликните на правильные области в указанном порядке';
        }

        return `
            <div style="margin: 20px 0; text-align: center;">
                <p>${instructions}</p>
                <div id="hotspotContainer" style="position: relative; display: inline-block; margin: 20px 0;">
                    <img src="${question.image}" alt="Hotspot image" style="max-width: 100%; border: 1px solid var(--border); border-radius: 8px;">
                    <div id="clickFeedback" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;"></div>
                </div>
            </div>
        `;
    },

    init(question, nextBtn, onAnswer) {
        const feedback = document.getElementById('clickFeedback');
        const img = feedback.previousElementSibling;
        let userClicks = [];

        feedback.addEventListener('click', (e) => {
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const click = { x, y };
            userClicks.push(click);
            onAnswer(userClicks);

            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.left = `${x}px`;
            marker.style.top = `${y}px`;
            marker.style.width = '20px';
            marker.style.height = '20px';
            marker.style.borderRadius = '50%';
            marker.style.backgroundColor = 'rgba(239, 68, 68, 0.7)';
            marker.style.transform = 'translate(-50%, -50%)';
            marker.style.pointerEvents = 'none';

            if (question.type === 'hotspot-multiple' || question.type === 'hotspot-sequence') {
                const markerCount = document.querySelectorAll('#clickFeedback > div').length;
                marker.textContent = markerCount + 1;
                marker.style.fontSize = '12px';
                marker.style.color = 'white';
            }
            feedback.appendChild(marker);

            nextBtn.disabled = false;
        });
    },

    validate(question, userClicks) {
        if (!userClicks || userClicks.length === 0) return false;

        const isClickInZone = (click, zone) => 
            Math.abs(click.x - zone.x) < zone.tolerance &&
            Math.abs(click.y - zone.y) < zone.tolerance;

        if (question.type === 'hotspot') {
            return question.zones.some(zone => isClickInZone(userClicks[0], zone));
        } else if (question.type === 'hotspot-multiple') {
            if (userClicks.length !== question.zones.length) return false;
            const correctZones = [...question.zones];
            const userCorrectClicks = userClicks.filter(click => 
                correctZones.some((zone, index) => {
                    if (isClickInZone(click, zone)) {
                        correctZones.splice(index, 1);
                        return true;
                    }
                    return false;
                })
            );
            return userCorrectClicks.length === question.zones.length;
        } else if (question.type === 'hotspot-sequence') {
            if (userClicks.length !== question.zones.length) return false;
            return userClicks.every((click, index) => isClickInZone(click, question.zones[index]));
        }
        return false;
    }
};