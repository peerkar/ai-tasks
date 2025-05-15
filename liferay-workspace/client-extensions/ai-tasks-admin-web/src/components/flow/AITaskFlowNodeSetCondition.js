import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { v4 as uuidv4 } from 'uuid';

import { useAITasksContext } from '../../contexts/AITasksContext';

const AITaskFlowNodeSetCondition = () => {
  const { selectedNode, setSelectedNode } = useAITasksContext();
  const [currentNode, setCurrentNode] = useState(selectedNode);
  const [conditionType, setConditionType] = useState('equals');

  const { t } = useTranslation();

  useEffect(() => {
    setCurrentNode(selectedNode);
    if (currentNode?.condition) {
      setConditionType(Object.keys(currentNode.condition)[0]);
    } else {
      setConditionType('equals');
    }
  }, [selectedNode]);

  const handleConditionTypeChange = (e) => {
    const newConditionType = e.target.value;

    setConditionType(newConditionType);

    let newCondition;
    if (newConditionType === 'allConditions' || newConditionType === 'anyConditions') {
      newCondition = { [newConditionType]: [] };
    } else if (newConditionType === 'not') {
      newCondition = { [newConditionType]: {} };
    } else {
      newCondition = {
        [newConditionType]: {
          id: `${currentNode.id}Condition`,
        },
      };
    }

    const newNode = {
      ...currentNode,
      condition: newCondition,
    };
    setCurrentNode(newNode);
    setSelectedNode(newNode);
  };

  const handleConditionFieldChange = (e) => {
    const newField = e.target.value;
    const newCondition = {
      ...currentNode.condition,
    };
    if (!newCondition) {
      newCondition[conditionType] = {
        field: newField,
        id: `${currentNode.id}Condition`,
      };
    } else {
      newCondition[conditionType] = {
        ...newCondition[conditionType],
        field: newField,
        id: `${currentNode.id}Condition`,
      };
    }

    const newNode = {
      ...currentNode,
      condition: newCondition,
    };
    setCurrentNode(newNode);
    setSelectedNode(newNode);
  };

  const handleConditionValueChange = (e) => {
    const newValue = e.target.value;
    const newCondition = {
      ...currentNode.condition,
    };
    if (!newCondition) {
      newCondition[conditionType] = {
        id: `${currentNode.id}Condition`,
        value: newValue,
      };
    } else {
      newCondition[conditionType] = {
        ...newCondition[conditionType],
        id: `${currentNode.id}Condition`,
        value: newValue,
      };
    }

    const newNode = {
      ...currentNode,
      condition: newCondition,
    };
    setCurrentNode(newNode);
    setSelectedNode(newNode);
  };

  const handleAddNestedCondition = (conditionListKey) => {
    const newCondition = {
      equals: {
        id: uuidv4(),
        field: '',
        value: '',
      },
    };

    const newNode = {
      ...currentNode,
      condition: {
        ...currentNode.condition,
        [conditionListKey]: [...(currentNode.condition[conditionListKey] || []), newCondition],
      },
    };
    setCurrentNode(newNode);
    setSelectedNode(newNode);
  };

  const handleNestedConditionChange = (conditionListKey, index, updatedCondition) => {
    const updatedConditions = [...(currentNode.condition[conditionListKey] || [])];
    updatedConditions[index] = updatedCondition;

    const newNode = {
      ...currentNode,
      condition: {
        ...currentNode.condition,
        [conditionListKey]: updatedConditions,
      },
    };
    setCurrentNode(newNode);
    setSelectedNode(newNode);
  };

  const handleRemoveNestedCondition = (conditionListKey, index) => {
    const updatedConditions = [...(currentNode.condition[conditionListKey] || [])];
    updatedConditions.splice(index, 1);

    const newNode = {
      ...currentNode,
      condition: {
        ...currentNode.condition,
        [conditionListKey]: updatedConditions,
      },
    };
    setCurrentNode(newNode);
    setSelectedNode(newNode);
  };

  const handleNotConditionChange = (updatedCondition) => {
    const newNode = {
      ...currentNode,
      condition: {
        not: updatedCondition,
      },
    };
    setCurrentNode(newNode);
    setSelectedNode(newNode);
  };

  if (!selectedNode) {
    return null;
  }

  return (
    <div className="form-group">
      <div className="form-group">
        <label htmlFor="conditionType">{t('condition-type-label')}</label>
        <select
          id="conditionType"
          className="form-control"
          value={conditionType}
          onChange={handleConditionTypeChange}
        >
          <option value="equals">{t('equals')}</option>
          <option value="contains">{t('contains')}</option>
          <option value="in">{t('in')}</option>
          <option value="exists">{t('exists')}</option>
          <option value="not">{t('not')}</option>
          <option value="allConditions">{t('allConditions')}</option>
          <option value="anyConditions">{t('anyConditions')}</option>
        </select>
      </div>

      {conditionType !== 'allConditions' &&
        conditionType !== 'anyConditions' &&
        conditionType !== 'not' && (
          <div className="form-group">
            <label htmlFor="conditionField">{t('condition-field-label')}</label>
            <input
              id="conditionField"
              placeholder="{{taskContext.outputOne}}"
              value={currentNode.condition?.[conditionType]?.field || ''}
              type="text"
              className="form-control"
              onChange={handleConditionFieldChange}
            />
          </div>
        )}

      {conditionType === 'equals' && (
        <div className="form-group">
          <label htmlFor="conditionValue">{t('condition-value-label')}</label>
          <input
            id="conditionValue"
            placeholder="someValue"
            value={currentNode.condition?.equals?.value || ''}
            type="text"
            className="form-control"
            onChange={handleConditionValueChange}
          />
        </div>
      )}

      {conditionType === 'contains' && (
        <div className="form-group">
          <label htmlFor="conditionValue">{t('condition-value-label')}</label>
          <input
            id="conditionValue"
            placeholder="someValue"
            value={currentNode.condition?.contains?.value || ''}
            type="text"
            className="form-control"
            onChange={handleConditionFieldChange}
          />
        </div>
      )}

      {conditionType === 'in' && (
        <div className="form-group">
          <label htmlFor="conditionValue">{t('condition-value-label')}</label>
          <input
            id="conditionValue"
            placeholder="someValue"
            value={currentNode.condition?.in?.value || ''}
            type="text"
            className="form-control"
            onChange={handleConditionFieldChange}
          />
        </div>
      )}

      {conditionType === 'exists' && <p>{t('exists-condition-description')}</p>}

      {conditionType === 'not' && (
        <div className="form-group">
          <p>
            <strong>{t('not-condition-label')}</strong>
          </p>
          <NestedConditionEditor
            condition={currentNode.condition.not}
            onChange={handleNotConditionChange}
          />
        </div>
      )}

      {(conditionType === 'allConditions' || conditionType === 'anyConditions') && (
        <div className="form-group">
          <p>
            <strong>
              {conditionType === 'allConditions'
                ? t('all-conditions-label')
                : t('any-conditions-label')}
            </strong>
          </p>
          {currentNode.condition?.[conditionType]?.map((nestedCondition, index) => (
            <div key={index} className="nested-condition p-5 my-3 border border-secondary">
              <NestedConditionEditor
                condition={nestedCondition}
                onChange={(updatedCondition) =>
                  handleNestedConditionChange(conditionType, index, updatedCondition)
                }
              />
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveNestedCondition(conditionType, index)}
              >
                {t('remove-condition')}
              </button>
            </div>
          ))}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleAddNestedCondition(conditionType)}
          >
            {t('add-condition')}
          </button>
        </div>
      )}
    </div>
  );
};

const NestedConditionEditor = ({ condition, onChange }) => {
  const [nestedCondition, setNestedCondition] = useState(condition || {});
  const [nestedConditionType, setNestedConditionType] = useState('equals');
  const { t } = useTranslation();

  const isConditionTypeChanging = useRef(false);

  useEffect(() => {
    if (isConditionTypeChanging.current) {
      setNestedCondition(condition || {});
    }

    if (condition) {
      const firstKey = Object.keys(condition)[0];
    }
  }, [condition]);

  useEffect(() => {
    if (isConditionTypeChanging.current) {
      onChange(nestedCondition);
    }
    isConditionTypeChanging.current = false;
  }, [nestedCondition]);

  const handleNestedConditionTypeChange = (e) => {
    isConditionTypeChanging.current = true;
    const newNestedConditionType = e.target.value;
    setNestedConditionType(newNestedConditionType);

    let newCondition;
    if (newNestedConditionType === 'allConditions' || newNestedConditionType === 'anyConditions') {
      newCondition = { [newNestedConditionType]: [] }; // Initialize as an empty array
    } else if (newNestedConditionType === 'not') {
      newCondition = { [newNestedConditionType]: {} }; // Initialize as an empty object
    } else {
      newCondition = {
        [newNestedConditionType]: {
          id: uuidv4(),
        },
      };
    }

    setNestedCondition(newCondition);
  };

  const handleNestedFieldChange = (e) => {
    setNestedCondition({
      ...nestedCondition,
      [nestedConditionType]: {
        ...nestedCondition[nestedConditionType],
        field: e.target.value,
      },
    });
  };

  const handleNestedValueChange = (e) => {
    setNestedCondition({
      ...nestedCondition,
      [nestedConditionType]: {
        ...nestedCondition[nestedConditionType],
        value: e.target.value,
      },
    });
  };

  const handleNestedNotConditionChange = (updatedCondition) => {
    setNestedCondition({
      ...nestedCondition,
      not: updatedCondition,
    });
  };

  const handleAddNestedCondition = (conditionListKey) => {
    const newCondition = {
      equals: {
        id: uuidv4(),
        field: '',
        value: '',
      },
    };

    setNestedCondition({
      ...nestedCondition,
      [conditionListKey]: [...(nestedCondition[conditionListKey] || []), newCondition],
    });
  };

  const handleNestedConditionChange = (conditionListKey, index, updatedCondition) => {
    const updatedConditions = [...(nestedCondition[conditionListKey] || [])];
    updatedConditions[index] = updatedCondition;

    setNestedCondition({
      ...nestedCondition,
      [conditionListKey]: updatedConditions,
    });
  };

  const handleRemoveNestedCondition = (conditionListKey, index) => {
    const updatedConditions = [...(nestedCondition[conditionListKey] || [])];
    updatedConditions.splice(index, 1);

    setNestedCondition({
      ...nestedCondition,
      [conditionListKey]: updatedConditions,
    });
  };
  return (
    <div className="nested-condition-editor">
      <div className="form-group">
        <label htmlFor="nestedConditionType">{t('condition-type-label')}</label>
        <select
          id="nestedConditionType"
          className="form-control"
          value={nestedConditionType}
          onChange={handleNestedConditionTypeChange}
        >
          <option value="equals">{t('equals')}</option>
          <option value="contains">{t('contains')}</option>
          <option value="in">{t('in')}</option>
          <option value="exists">{t('exists')}</option>
          <option value="not">{t('not')}</option>
          <option value="allConditions">{t('allConditions')}</option>
          <option value="anyConditions">{t('anyConditions')}</option>
        </select>
      </div>

      {nestedConditionType !== 'allConditions' &&
        nestedConditionType !== 'anyConditions' &&
        nestedConditionType !== 'not' && (
          <div className="form-group">
            <label htmlFor="nestedConditionField">{t('condition-field-label')}</label>
            <input
              id="nestedConditionField"
              placeholder="{{taskContext.outputOne}}"
              value={nestedCondition?.[nestedConditionType]?.field || ''}
              type="text"
              className="form-control"
              onChange={handleNestedFieldChange}
            />
          </div>
        )}

      {nestedConditionType === 'equals' && (
        <div className="form-group">
          <label htmlFor="nestedConditionValue">{t('condition-value-label')}</label>
          <input
            id="nestedConditionValue"
            placeholder="someValue"
            value={nestedCondition?.equals?.value || ''}
            type="text"
            className="form-control"
            onChange={handleNestedValueChange}
          />
        </div>
      )}

      {nestedConditionType === 'contains' && (
        <div className="form-group">
          <label htmlFor="nestedConditionValue">{t('condition-value-label')}</label>
          <input
            id="nestedConditionValue"
            placeholder="someValue"
            value={nestedCondition?.contains?.value || ''}
            type="text"
            className="form-control"
            onChange={handleNestedValueChange}
          />
        </div>
      )}

      {nestedConditionType === 'in' && (
        <div className="form-group">
          <label htmlFor="nestedConditionValue">{t('condition-value-label')}</label>
          <input
            id="nestedConditionValue"
            placeholder="someValue"
            value={nestedCondition?.in?.value || ''}
            type="text"
            className="form-control"
            onChange={handleNestedValueChange}
          />
        </div>
      )}

      {nestedConditionType === 'exists' && <p>{t('exists-condition-description')}</p>}

      {nestedConditionType === 'not' && (
        <div className="form-group">
          <p>
            <strong>{t('not-condition-label')}</strong>
          </p>
          <NestedConditionEditor
            condition={nestedCondition.not}
            onChange={handleNestedNotConditionChange}
          />
        </div>
      )}
      {(nestedConditionType === 'allConditions' || nestedConditionType === 'anyConditions') && (
        <div className="form-group">
          <p>
            <strong>
              {nestedConditionType === 'allConditions'
                ? t('all-conditions-label')
                : t('any-conditions-label')}
            </strong>
          </p>
          {nestedCondition?.[nestedConditionType]?.map((nestedCondition, index) => (
            <div key={index} className="nested-condition p-5 my-3 border border-secondary">
              <NestedConditionEditor
                condition={nestedCondition}
                onChange={(updatedCondition) =>
                  handleNestedConditionChange(nestedConditionType, index, updatedCondition)
                }
              />
              <button
                className="btn btn-danger btn-sm my-3"
                onClick={() => handleRemoveNestedCondition(nestedConditionType, index)}
              >
                {t('remove-condition')}
              </button>
            </div>
          ))}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleAddNestedCondition(nestedConditionType)}
          >
            {t('add-condition')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AITaskFlowNodeSetCondition;
