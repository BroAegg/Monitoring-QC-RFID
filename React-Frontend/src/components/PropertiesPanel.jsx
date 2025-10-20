import React from 'react';

const PropertiesPanel = ({ element, onUpdate, onDelete }) => {
    if (!element) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) : value;
        onUpdate(element.id, { [name]: finalValue });
    };

    return (
        <div className="properties-panel">
            <h3>Properties</h3>
            <div className="prop-group">
                <label>Label</label>
                <input type="text" name="label" value={element.label} onChange={handleChange} />
            </div>
            <div className="prop-group">
                <label>X</label>
                <input type="number" name="x" value={Math.round(element.x)} onChange={handleChange} />
            </div>
            <div className="prop-group">
                <label>Y</label>
                <input type="number" name="y" value={Math.round(element.y)} onChange={handleChange} />
            </div>
            {element.type === 'block' && (
                <>
                    <div className="prop-group">
                        <label>Width</label>
                        <input type="number" name="w" value={Math.round(element.w)} onChange={handleChange} />
                    </div>
                    <div className="prop-group">
                        <label>Height</label>
                        <input type="number" name="h" value={Math.round(element.h)} onChange={handleChange} />
                    </div>
                </>
            )}
            <div className="prop-group">
                <label>Color</label>
                <input type="color" name="color" value={element.color} onChange={handleChange} />
            </div>
            <button className="delete-btn" onClick={() => onDelete(element.id)}>Delete Element</button>
        </div>
    );
};

export default PropertiesPanel;